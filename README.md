# Solana Vault

A simple app that simulates the process of staking Solana NFTs. This project uses ironaddicteddog's Anchor Escrow program as a foundational starting point, and will have several features added to it to expand its functionality, as well as offer interactivity through a React front-end.

TODO:
Write assertions and fail-case tests.
Make the vault PDAs more specific to allow for a) cuncurrent users staking simultaneously, b) multiple vaults per user.
Add support for staking multiple NFTs in a single vault.
Add support for lock-up periods with automatic unstaking upon expiration.
Create an spl-token mint to be used for reward distribution.
Add support for automatic periodic distribution of rewards during lock-up period.
Add React UI with Phantom Wallet integration.
