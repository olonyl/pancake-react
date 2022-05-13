import '../styles/globals.css'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'


function MyApp({ Component, pageProps }) {

  const getLayout = Component.getLayout || ((page) => page)
  return getLayout(<Component {...pageProps} >
    <AmplifySignOut />
  </Component>)
}

export default withAuthenticator(MyApp);
