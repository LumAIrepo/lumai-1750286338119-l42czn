```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::convert::TryInto;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct PriceData {
    pub price: u64,
    pub confidence: u64,
    pub timestamp: i64,
}

pub fn calculate_payout_ratio(
    total_yes_amount: u64,
    total_no_amount: u64,
    winning_side: bool,
) -> Result<u64> {
    let total_pool = total_yes_amount
        .checked_add(total_no_amount)
        .ok_or(ErrorCode::MathOverflow)?;
    
    if total_pool == 0 {
        return Ok(0);
    }

    let winning_amount = if winning_side {
        total_yes_amount
    } else {
        total_no_amount
    };

    if winning_amount == 0 {
        return Ok(0);
    }

    // Calculate payout ratio as (total_pool * 10000) / winning_amount
    // Using 10000 as basis points for precision
    let ratio = total_pool
        .checked_mul(10000)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(winning_amount)
        .ok_or(ErrorCode::DivisionByZero)?;

    Ok(ratio)
}

pub fn calculate_user_payout(
    user_bet_amount: u64,
    payout_ratio: u64,
) -> Result<u64> {
    let payout = user_bet_amount
        .checked_mul(payout_ratio)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    Ok(payout)
}

pub fn calculate_platform_fee(
    total_amount: u64,
    fee_basis_points: u16,
) -> Result<u64> {
    let fee = (total_amount as u128)
        .checked_mul(fee_basis_points as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::DivisionByZero)?;

    Ok(fee.try_into().map_err(|_| ErrorCode::MathOverflow)?)
}

pub fn is_market_expired(
    current_timestamp: i64,
    expiry_timestamp: i64,
) -> bool {
    current_timestamp >= expiry_timestamp
}

pub fn is_market_resolved(
    resolution_timestamp: i64,
) -> bool {
    resolution_timestamp > 0
}

pub fn validate_price_data(
    price_data: &PriceData,
    max_staleness: i64,
    current_timestamp: i64,
) -> Result<()> {
    if current_timestamp - price_data.timestamp > max_staleness {
        return Err(ErrorCode::StalePrice.into());
    }

    if price_data.confidence == 0 {
        return Err(ErrorCode::InvalidPriceConfidence.into());
    }

    Ok(())
}

pub fn calculate_minimum_bet_amount(
    base_minimum: u64,
    market_liquidity: u64,
) -> u64 {
    let dynamic_minimum = market_liquidity
        .checked_div(1000)
        .unwrap_or(0);

    std::cmp::max(base_minimum, dynamic_minimum)
}

pub fn transfer_tokens<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_program = token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

pub fn transfer_tokens_with_signer<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &AccountInfo<'info>,
    token_program: &Program<'info, Token>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.clone(),
    };

    let cpi_program = token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

pub fn calculate_market_odds(
    yes_amount: u64,
    no_amount: u64,
) -> Result<(u64, u64)> {
    let total = yes_amount
        .checked_add(no_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    if total == 0 {
        return Ok((5000, 5000)); // 50/50 odds
    }

    let yes_odds = yes_amount
        .checked_mul(10000)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(total)
        .ok_or(ErrorCode::DivisionByZero)?;

    let no_odds = 10000
        .checked_sub(yes_odds)
        .ok_or(ErrorCode::MathOverflow)?;

    Ok((yes_odds, no_odds))
}

pub fn validate_market_parameters(
    expiry_timestamp: i64,
    current_timestamp: i64,
    minimum_duration: i64,
    maximum_duration: i64,
) -> Result<()> {
    let duration = expiry_timestamp - current_timestamp;

    if duration < minimum_duration {
        return Err(ErrorCode::MarketDurationTooShort.into());
    }

    if duration > maximum_duration {
        return Err(ErrorCode::MarketDurationTooLong.into());
    }

    Ok(())
}

pub fn get_market_status(
    current_timestamp: i64,
    expiry_timestamp: i64,
    resolution_timestamp: i64,
) -> MarketStatus {
    if resolution_timestamp > 0 {
        MarketStatus::Resolved
    } else if current_timestamp >= expiry_timestamp {
        MarketStatus::Expired
    } else {
        MarketStatus::Active
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum MarketStatus {
    Active,
    Expired,
    Resolved,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Division by zero")]
    DivisionByZero,
    #[msg("Price data is stale")]
    StalePrice,
    #[msg("Invalid price confidence")]
    InvalidPriceConfidence,
    #[msg("Market duration too short")]
    MarketDurationTooShort,
    #[msg("Market duration too long")]
    MarketDurationTooLong,
}
```