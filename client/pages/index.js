import redirect from "../lib/redirect";
import API from "../lib/API";

export default class Index extends React.Component {
  static async getInitialProps(context, props) {
    const user = await new API(context).loggedInUser();
    console.log({user});
    if (!user) {
      // If not signed in, send them somewhere more useful
      redirect(context, "/signin");
    }

    return { user };
  }

  render = () => {
    return (
      <div>
        <p>{`Hello ${this.props.user.display_name}!`}</p>
        <p>{`Your email is \`${this.props.user.email}\`.`}</p>
      </div>
    );
  };
}
