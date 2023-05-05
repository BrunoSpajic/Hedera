// 302e020100300506032b657004220420d09e7c2e6e89a75352fa13d278ff76d8e518a677c3af850f11a9af3dcbbace9d
    // 0.0.4567537

    const { PrivateKey, Client, AccountCreateTransaction, TransferTransaction, Hbar } = require("@hashgraph/sdk");

    const treasuryAccount = PrivateKey.fromString("302e020100300506032b657004220420d09e7c2e6e89a75352fa13d278ff76d8e518a677c3af850f11a9af3dcbbace9d");
    const treasuryId = "0.0.4567537"
    
    const treasuryClient = Client.forTestnet();
    treasuryClient.setOperator(treasuryId, treasuryAccount).setDefaultMaxTransactionFee(new Hbar(10));
    
    async function createAccount(n) {
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const tx = await new AccountCreateTransaction()
            .setKey(newAccountPrivateKey)
            .execute(treasuryClient);
    
        const accountId = (await tx.getReceipt(treasuryClient)).accountId;
        console.log(`- Acount ${n}`);
        console.log(`Private key: ${newAccountPrivateKey}`);
        console.log(`Account ID: ${accountId}\n`);
        return accountId
    }
    
    async function fundAccounts(accountIds){
        console.log(accountIds)
        const tx = await new TransferTransaction()
            .addHbarTransfer(treasuryId, new Hbar(-10000))
            .addHbarTransfer(accountIds[0], new Hbar(2000))
            .addHbarTransfer(accountIds[1], new Hbar(2000))
            .addHbarTransfer(accountIds[2], new Hbar(2000))
            .addHbarTransfer(accountIds[3], new Hbar(2000))
            .addHbarTransfer(accountIds[4], new Hbar(2000))
            .execute(treasuryClient)
    
        const txId = (await tx.getReceipt(treasuryClient));
        console.log(txId)
    
    }
    
    async function main() {
        const accounts = [];
        for (let i = 1; i <= 5; i++) {
            let id = await createAccount(i);
            accounts.push(id)
        }
        
       await fundAccounts(accounts)
        process.exit()
    }
    
    main();