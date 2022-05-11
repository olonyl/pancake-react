import '../styles/globals.css'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} >
    <AmplifySignOut />
  </Component>
}

export default withAuthenticator(MyApp);
