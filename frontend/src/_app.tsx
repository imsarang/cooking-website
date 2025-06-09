import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Layout from '@/app/layout'; // Adjust if needed
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Routes that should NOT use the layout
  // const noLayoutRoutes = ['/auth'];

  // const isNoLayout = noLayoutRoutes.includes(router.pathname);

  // if (isNoLayout) {
  //   return <Component {...pageProps} />;
  // }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PersistGate>
    </Provider>
  );
}
