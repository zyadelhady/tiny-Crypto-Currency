import './App.css';
import { Mine } from './Components/Mine/Mine';
import { Container } from './Components/Container/Container';
import { CreateTransactionContainer } from './Containers/CreateTransactionContainer/CreateTransactionContainer';
import { BlockChain } from './Containers/BlockChain/BlockChain';
import { TxPool } from './Containers/TxPool/TxPool';
import { TxOutContainer } from './Containers/TxOutContainer/TxOutContainer';
import { ErrorNotification } from './Components/ErrorNotification/ErrorNotification';
import { Context } from './Context';
import { useContext } from 'react';

function App() {
  const { error } = useContext(Context);
  return (
    <div className="App">
      <Container>
        <Mine />
        <CreateTransactionContainer />
        <BlockChain />
        <TxPool />
        <TxOutContainer />
        {error ? <ErrorNotification error={error} /> : null}
      </Container>
    </div>
  );
}

export default App;
