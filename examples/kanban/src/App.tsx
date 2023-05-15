import { FunctionComponent } from 'react';

import Categories from './modules/categories';
import Modals from './modules/modals';

const App: FunctionComponent = () => {
  return (
    <>
      <Categories />
      <Modals />
    </>
  );
};

export default App;
