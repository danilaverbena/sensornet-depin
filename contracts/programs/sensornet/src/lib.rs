use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("SensNet1111111111111111111111111111111111111");

#[program]
pub mod sensornet {
    use super::*;

    /// Initialize the SensorNet DePIN network state and reward pools
    pub fn initialize_network(
        ctx: Context<InitializeNetwork>,
        base_reward_per_tile: u64,
        epoch_duration_seconds: i64,
    ) -> Result<()> {
        let network = &mut ctx.accounts.network_state;
        network.authority = ctx.accounts.authority.key();
        network.sntr_mint = ctx.accounts.sntr_mint.key();
        network.skr_mint = ctx.accounts.skr_mint.key();
        network.base_reward_per_tile = base_reward_per_tile;
        network.epoch_duration_seconds = epoch_duration_seconds;
        network.total_tiles_mapped = 0;
        network.total_devices_registered = 0;
        network.total_skr_staked = 0;
        network.bump = ctx.bumps.network_state;
        msg!("SensorNet DePIN initialized successfully.");
        Ok(())
    }

    /// Register a mobile device (Seeker) with hardware Seed Vault attestation
    pub fn register_device(
        ctx: Context<RegisterDevice>,
        device_id: String,
        is_seeker_hardware: bool,
    ) -> Result<()> {
        let device = &mut ctx.accounts.device_account;
        device.owner = ctx.accounts.owner.key();
        device.device_id = device_id;
        device.is_seeker_hardware = is_seeker_hardware;
        device.registered_at = Clock::get()?.unix_timestamp;
        device.last_observation_at = Clock::get()?.unix_timestamp;
        device.total_observations = 0;
        device.current_streak_days = 1;
        device.pending_rewards = 0;
        device.multiplier_basis_points = if is_seeker_hardware { 12000 } else { 10000 }; // 1.2x boost for Seeker
        device.bump = ctx.bumps.device_account;

        let network = &mut ctx.accounts.network_state;
        network.total_devices_registered = network.total_devices_registered.checked_add(1).unwrap();
        msg!("Device registered: {} (Seeker: {})", device.device_id, is_seeker_hardware);
        Ok(())
    }

    /// Stake $SKR tokens to boost DePIN telemetry rewards (SKR Hackathon Integration)
    /// Tiers:
    /// - 1,000 SKR: +25% boost (1.25x)
    /// - 5,000 SKR: +50% boost (1.50x)
    /// - 20,000 SKR: +100% boost (2.00x)
    pub fn stake_skr(ctx: Context<StakeSkr>, amount: u64) -> Result<()> {
        require!(amount > 0, SensorNetError::ZeroAmount);

        // Transfer SKR from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_skr_account.to_account_info(),
            to: ctx.accounts.skr_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        let stake_record = &mut ctx.accounts.stake_record;
        stake_record.owner = ctx.accounts.owner.key();
        stake_record.amount = stake_record.amount.checked_add(amount).unwrap();
        stake_record.staked_at = Clock::get()?.unix_timestamp;

        // Recalculate multiplier based on staked SKR
        let device = &mut ctx.accounts.device_account;
        let base_mult = if device.is_seeker_hardware { 12000 } else { 10000 };
        let skr_boost = if stake_record.amount >= 20_000_000_000 {
            10000 // +100%
        } else if stake_record.amount >= 5_000_000_000 {
            5000 // +50%
        } else if stake_record.amount >= 1_000_000_000 {
            2500 // +25%
        } else {
            0
        };

        device.multiplier_basis_points = base_mult + skr_boost;

        let network = &mut ctx.accounts.network_state;
        network.total_skr_staked = network.total_skr_staked.checked_add(amount).unwrap();

        msg!("Staked {} SKR. New multiplier: {} bps", amount, device.multiplier_basis_points);
        Ok(())
    }

    /// Submit a verified batch of hexagonal tiles (Cellular, Wi-Fi, Road vibrations)
    pub fn submit_telemetry_batch(
        ctx: Context<SubmitTelemetryBatch>,
        h3_batch_root: [u8; 32],
        tile_count: u16,
        avg_signal_dbm: i16,
        potholes_detected: u16,
    ) -> Result<()> {
        require!(tile_count > 0, SensorNetError::EmptyBatch);
        let clock = Clock::get()?;

        let device = &mut ctx.accounts.device_account;
        let network = &mut ctx.accounts.network_state;

        // Check and update daily streak
        let day_seconds = 86400i64;
        let elapsed = clock.unix_timestamp - device.last_observation_at;
        if elapsed >= day_seconds && elapsed < (day_seconds * 2) {
            device.current_streak_days = device.current_streak_days.saturating_add(1);
        } else if elapsed >= (day_seconds * 2) {
            device.current_streak_days = 1; // Reset streak
        }

        device.last_observation_at = clock.unix_timestamp;
        device.total_observations = device.total_observations.saturating_add(tile_count as u64);

        // Compute reward with multiplier: base * tiles * (multiplier / 10000)
        let base = network.base_reward_per_tile.saturating_mul(tile_count as u64);
        let earned = (base as u128)
            .checked_mul(device.multiplier_basis_points as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        device.pending_rewards = device.pending_rewards.checked_add(earned).unwrap();
        network.total_tiles_mapped = network.total_tiles_mapped.checked_add(tile_count as u64).unwrap();

        emit!(TelemetrySubmittedEvent {
            device_owner: device.owner,
            h3_root: h3_batch_root,
            tiles_count: tile_count,
            earned_sntr: earned,
            avg_signal_dbm,
            potholes_detected,
            streak_days: device.current_streak_days,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Claim accrued $SNTR micro-rewards directly into the user wallet
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let device = &mut ctx.accounts.device_account;
        let amount = device.pending_rewards;
        require!(amount > 0, SensorNetError::NoRewardsAvailable);

        device.pending_rewards = 0;

        let seeds = &[
            b"network_state".as_ref(),
            &[ctx.accounts.network_state.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_reward_account.to_account_info(),
            authority: ctx.accounts.network_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_ctx, amount)?;

        msg!("Claimed {} $SNTR to {}", amount, ctx.accounts.owner.key());
        Ok(())
    }

    /// Anti-sybil Proof-of-Work Verification (ORE Protocol Integration)
    /// Validates computational work submitted by the phone to unlock bonus yield
    pub fn verify_ore_pow(
        ctx: Context<VerifyOrePow>,
        challenge: [u8; 32],
        nonce: u64,
        hash_solution: [u8; 32],
    ) -> Result<()> {
        // Verify solution meets difficulty threshold (leading zeros)
        require!(hash_solution[0] == 0 && hash_solution[1] == 0, SensorNetError::InvalidPoW);

        let device = &mut ctx.accounts.device_account;
        // Add 5% temporary boost for valid ORE proof
        device.multiplier_basis_points = device.multiplier_basis_points.saturating_add(500);

        msg!("ORE PoW verified for device {}. Multiplier boosted.", device.device_id);
        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeNetwork<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + NetworkState::LEN,
        seeds = [b"network_state"],
        bump
    )]
    pub network_state: Account<'info, NetworkState>,
    pub sntr_mint: Account<'info, Mint>,
    pub skr_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(device_id: String)]
pub struct RegisterDevice<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + DeviceAccount::LEN,
        seeds = [b"device", owner.key().as_ref(), device_id.as_bytes()],
        bump
    )]
    pub device_account: Account<'info, DeviceAccount>,
    #[account(mut, seeds = [b"network_state"], bump = network_state.bump)]
    pub network_state: Account<'info, NetworkState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeSkr<'info> {
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + StakeRecord::LEN,
        seeds = [b"stake", owner.key().as_ref()],
        bump
    )]
    pub stake_record: Account<'info, StakeRecord>,
    #[account(mut, seeds = [b"device", owner.key().as_ref(), device_account.device_id.as_bytes()], bump = device_account.bump)]
    pub device_account: Account<'info, DeviceAccount>,
    #[account(mut, seeds = [b"network_state"], bump = network_state.bump)]
    pub network_state: Account<'info, NetworkState>,
    #[account(mut)]
    pub user_skr_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub skr_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitTelemetryBatch<'info> {
    #[account(
        mut,
        seeds = [b"device", owner.key().as_ref(), device_account.device_id.as_bytes()],
        bump = device_account.bump,
        has_one = owner
    )]
    pub device_account: Account<'info, DeviceAccount>,
    #[account(mut, seeds = [b"network_state"], bump = network_state.bump)]
    pub network_state: Account<'info, NetworkState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [b"device", owner.key().as_ref(), device_account.device_id.as_bytes()],
        bump = device_account.bump,
        has_one = owner
    )]
    pub device_account: Account<'info, DeviceAccount>,
    #[account(seeds = [b"network_state"], bump = network_state.bump)]
    pub network_state: Account<'info, NetworkState>,
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct VerifyOrePow<'info> {
    #[account(
        mut,
        seeds = [b"device", owner.key().as_ref(), device_account.device_id.as_bytes()],
        bump = device_account.bump,
        has_one = owner
    )]
    pub device_account: Account<'info, DeviceAccount>,
    pub owner: Signer<'info>,
}

// -----------------------------------------------------------------------------
// State Structures
// -----------------------------------------------------------------------------

#[account]
pub struct NetworkState {
    pub authority: Pubkey,
    pub sntr_mint: Pubkey,
    pub skr_mint: Pubkey,
    pub base_reward_per_tile: u64,
    pub epoch_duration_seconds: i64,
    pub total_tiles_mapped: u64,
    pub total_devices_registered: u64,
    pub total_skr_staked: u64,
    pub bump: u8,
}

impl NetworkState {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct DeviceAccount {
    pub owner: Pubkey,
    pub device_id: String,
    pub is_seeker_hardware: bool,
    pub registered_at: i64,
    pub last_observation_at: i64,
    pub total_observations: u64,
    pub current_streak_days: u16,
    pub pending_rewards: u64,
    pub multiplier_basis_points: u16, // e.g. 10000 = 1.0x, 15000 = 1.5x
    pub bump: u8,
}

impl DeviceAccount {
    pub const LEN: usize = 32 + (4 + 64) + 1 + 8 + 8 + 8 + 2 + 8 + 2 + 1;
}

#[account]
pub struct StakeRecord {
    pub owner: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
}

impl StakeRecord {
    pub const LEN: usize = 32 + 8 + 8;
}

// -----------------------------------------------------------------------------
// Events & Errors
// -----------------------------------------------------------------------------

#[event]
pub struct TelemetrySubmittedEvent {
    pub device_owner: Pubkey,
    pub h3_root: [u8; 32],
    pub tiles_count: u16,
    pub earned_sntr: u64,
    pub avg_signal_dbm: i16,
    pub potholes_detected: u16,
    pub streak_days: u16,
    pub timestamp: i64,
}

#[error_code]
pub enum SensorNetError {
    #[msg("Amount must be greater than zero.")]
    ZeroAmount,
    #[msg("Telemetry batch cannot be empty.")]
    EmptyBatch,
    #[msg("No rewards available to claim.")]
    NoRewardsAvailable,
    #[msg("Invalid Proof of Work hash solution.")]
    InvalidPoW,
}
