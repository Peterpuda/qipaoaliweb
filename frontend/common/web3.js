export async function connectWallet(){
    if (!window.ethereum) throw new Error('No wallet found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  }