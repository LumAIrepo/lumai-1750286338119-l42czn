```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum PredictionMarketError {
    #[msg("Market is not active")]
    MarketNotActive,
    
    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,
    
    #[msg("Market resolution time has not passed")]
    MarketNotExpired,
    
    #[msg("Invalid market outcome")]
    InvalidOutcome,
    
    #[msg("Insufficient funds for prediction")]
    InsufficientFunds,
    
    #[msg("Prediction amount must be greater than zero")]
    InvalidPredictionAmount,
    
    #[msg("User has no prediction in this market")]
    NoPredictionFound,
    
    #[msg("Cannot predict on expired market")]
    MarketExpired,
    
    #[msg("Unauthorized market resolution")]
    UnauthorizedResolution,
    
    #[msg("Market creator cannot participate in their own market")]
    CreatorCannotPredict,
    
    #[msg("Invalid market duration")]
    InvalidMarketDuration,
    
    #[msg("Market title too long")]
    MarketTitleTooLong,
    
    #[msg("Market description too long")]
    MarketDescriptionTooLong,
    
    #[msg("Invalid oracle authority")]
    InvalidOracleAuthority,
    
    #[msg("Oracle has already resolved this market")]
    OracleAlreadyResolved,
    
    #[msg("Minimum prediction amount not met")]
    MinimumPredictionNotMet,
    
    #[msg("Maximum prediction amount exceeded")]
    MaximumPredictionExceeded,
    
    #[msg("Market has insufficient liquidity")]
    InsufficientLiquidity,
    
    #[msg("Invalid prediction side")]
    InvalidPredictionSide,
    
    #[msg("Cannot withdraw before market resolution")]
    CannotWithdrawBeforeResolution,
    
    #[msg("No winnings to claim")]
    NoWinningsToClaim,
    
    #[msg("Winnings already claimed")]
    WinningsAlreadyClaimed,
    
    #[msg("Market fee calculation error")]
    MarketFeeError,
    
    #[msg("Invalid fee percentage")]
    InvalidFeePercentage,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
    
    #[msg("Division by zero")]
    DivisionByZero,
    
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    
    #[msg("Token account not owned by user")]
    InvalidTokenAccountOwner,
    
    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,
    
    #[msg("Market paused by admin")]
    MarketPaused,
    
    #[msg("Feature not implemented")]
    NotImplemented,
}
```