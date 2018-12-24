import redirect from "../lib/redirect";
import auth from '../lib/auth';

export default class Index extends React.Component {
  static async getInitialProps (context, props) {
    const userSession = await auth.loggedInUser()
    if (!userSession) {
      // If not signed in, send them somewhere more useful
      redirect(context, '/signin')
    }

    return { userSession }
  }

  render = () => {
    return(
    <div>
      <p>{`Hello ${this.props.userSession.display_name}!`}</p>
      <p>{`Your email is \`${this.props.userSession.email}\`.`}</p>
    </div>
  );}
};
