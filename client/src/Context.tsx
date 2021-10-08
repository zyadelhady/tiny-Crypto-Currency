import { FC, createContext, useState, useEffect } from 'react';
import { Blockchain, IBlock, ITransaction, Transactions, UTxOuts } from './types';
import axios from './axios';

export const Context = createContext({
  address: '',
  balance: 0,
  blockchain: [] as Blockchain,
  uTxOuts: [] as UTxOuts,
  txPool: [] as Transactions,
  handleSendTx: (address: string, amount: number) => {},
  handleMineBlock: () => {},
  error: '',
});

const getAddress = async () => {
  return (await axios.get<string>('/address')).data;
};

const getBlockchain = async () => {
  return (await axios.get<Blockchain>('/blocks')).data;
};

const getUTxOuts = async () => {
  return (await axios.get<UTxOuts>('/myUTxOuts')).data;
};

const getTxPool = async () => {
  return (await axios.get<Transactions>('/txPool')).data;
};

const getBalance = async () => {
  return (await axios.get<{ balance: number }>('/balance')).data.balance;
};

const sendTx = async (address: string, amount: number) => {
  return (await axios.post<ITransaction>('/sendTx', { address, amount })).data;
};

const mineBlock = async () => {
  return (await axios.post<IBlock>('/mine/block')).data;
};

export const ContextProvider: FC = ({ children }) => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [blockchain, setBlockchain] = useState<Blockchain>([]);
  const [uTxOuts, setUTxOuts] = useState<UTxOuts>([]);
  const [txPool, setTxPool] = useState<Transactions>([]);
  const [error, setError] = useState<string>('');

  const init = async () => {
    setAddress(await getAddress());
    setBalance(await getBalance());
    setBlockchain(await getBlockchain());
    setUTxOuts(await getUTxOuts());
    setTxPool(await getTxPool());
    setError('');
  };

  const handleSendTx = async (address: string, amount: number) => {
    try {
      const tx = await sendTx(address, amount);
      setTxPool((prev) => [...prev, tx]);
    } catch (err: any) {
      setError(err.response.data.message);
      setTimeout(() => {
        setError('');
      }, 1000);
    }
  };

  const handleMineBlock = async () => {
    const block = await mineBlock();
    if (!block) return;
    setBlockchain((prev) => [...prev, block]);
    setBalance(await getBalance());
    setTxPool(await getTxPool());
    setUTxOuts(await getUTxOuts());
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Context.Provider value={{ address, balance, blockchain, uTxOuts, txPool, handleSendTx, handleMineBlock, error }}>
      {children}
    </Context.Provider>
  );
};
