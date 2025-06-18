```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PredictionMarket::INIT_SPACE,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, PredictionMarket>,

    #[account(
        init,
        payer = authority,
        token::mint = quote_mint,
        token::authority = market,
        seeds = [b"market_vault", market.key().as_ref()],
        bump
    )]
    pub market_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = outcome_a_mint,
        token::authority = market,
        seeds = [b"outcome_a_vault", market.key().as_ref()],
        bump
    )]
    pub outcome_a_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = outcome_b_mint,
        token::authority = market,
        seeds = [b"outcome_b_vault", market.key().as_ref()],
        bump
    )]
    pub outcome_b_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        mint::decimals = quote_mint.decimals,
        mint::authority = market,
        seeds = [b"outcome_a_mint", market.key().as_ref()],
        bump
    )]
    pub outcome_a_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        mint::decimals = quote_mint.decimals,
        mint::authority = market,
        seeds = [b"outcome_b_mint", market.key().as_ref()],
        bump
    )]
    pub outcome_b_mint: Account<'info, Mint>,

    pub quote_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(InitSpace)]
pub struct PredictionMarket {
    pub authority: Pubkey,
    pub market_id: u64,
    pub question: String,
    pub description: String,
    pub quote_mint: Pubkey,
    pub outcome_a_mint: Pubkey,
    pub outcome_b_mint: Pubkey,
    pub market_vault: Pubkey,
    pub outcome_a_vault: Pubkey,
    pub outcome_b_vault: Pubkey,
    pub resolution_time: i64,
    pub creation_time: i64,
    pub total_liquidity: u64,
    pub outcome_a_price: u64,
    pub outcome_b_price: u64,
    pub is_resolved: bool,
    pub winning_outcome: Option<u8>,
    pub market_vault_bump: u8,
    pub outcome_a_vault_bump: u8,
    pub outcome_b_vault_bump: u8,
    pub outcome_a_mint_bump: u8,
    pub outcome_b_mint_bump: u8,
    pub bump: u8,
}

pub fn create_market(
    ctx: Context<CreateMarket>,
    market_id: u64,
    question: String,
    description: String,
    resolution_time: i64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let clock = Clock::get()?;

    require!(
        resolution_time > clock.unix_timestamp,
        PredictionMarketError::InvalidResolutionTime
    );

    require!(
        question.len() <= 200,
        PredictionMarketError::QuestionTooLong
    );

    require!(
        description.len() <= 500,
        PredictionMarketError::DescriptionTooLong
    );

    market.authority = ctx.accounts.authority.key();
    market.market_id = market_id;
    market.question = question;
    market.description = description;
    market.quote_mint = ctx.accounts.quote_mint.key();
    market.outcome_a_mint = ctx.accounts.outcome_a_mint.key();
    market.outcome_b_mint = ctx.accounts.outcome_b_mint.key();
    market.market_vault = ctx.accounts.market_vault.key();
    market.outcome_a_vault = ctx.accounts.outcome_a_vault.key();
    market.outcome_b_vault = ctx.accounts.outcome_b_vault.key();
    market.resolution_time = resolution_time;
    market.creation_time = clock.unix_timestamp;
    market.total_liquidity = 0;
    market.outcome_a_price = 50_000_000; // 0.5 with 8 decimals
    market.outcome_b_price = 50_000_000; // 0.5 with 8 decimals
    market.is_resolved = false;
    market.winning_outcome = None;

    let (_, market_vault_bump) = Pubkey::find_program_address(
        &[b"market_vault", market.key().as_ref()],
        ctx.program_id
    );
    market.market_vault_bump = market_vault_bump;

    let (_, outcome_a_vault_bump) = Pubkey::find_program_address(
        &[b"outcome_a_vault", market.key().as_ref()],
        ctx.program_id
    );
    market.outcome_a_vault_bump = outcome_a_vault_bump;

    let (_, outcome_b_vault_bump) = Pubkey::find_program_address(
        &[b"outcome_b_vault", market.key().as_ref()],
        ctx.program_id
    );
    market.outcome_b_vault_bump = outcome_b_vault_bump;

    let (_, outcome_a_mint_bump) = Pubkey::find_program_address(
        &[b"outcome_a_mint", market.key().as_ref()],
        ctx.program_id
    );
    market.outcome_a_mint_bump = outcome_a_mint_bump;

    let (_, outcome_b_mint_bump) = Pubkey::find_program_address(
        &[b"outcome_b_mint", market.key().as_ref()],
        ctx.program_id
    );
    market.outcome_b_mint_bump = outcome_b_mint_bump;

    let (_, bump) = Pubkey::find_program_address(
        &[b"market", market_id.to_le_bytes().as_ref()],
        ctx.program_id
    );
    market.bump = bump;

    emit!(MarketCreated {
        market: market.key(),
        authority: market.authority,
        market_id,
        question: market.question.clone(),
        resolution_time,
        creation_time: market.creation_time,
    });

    Ok(())
}

#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub authority: Pubkey,
    pub market_id: u64,
    pub question: String,
    pub resolution_time: i64,
    pub creation_time: i64,
}

#[error_code]
pub enum PredictionMarketError {
    #[msg("Invalid resolution time")]
    InvalidResolutionTime,
    #[msg("Question too long")]
    QuestionTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
}
```