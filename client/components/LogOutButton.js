import redirect from "../lib/redirect";
import API from "../lib/API";

export default class LogOutButton extends React.Component {

  render = () => (
    <form onSubmit={this.handleOnLogOut}>
      <button>Sign Out</button>
    </form>
  );

  handleOnLogOut = e => {
    e.preventDefault();
    e.stopPropagation();
    new API(this.context).signout()
      .then(signedOut => {
        console.log("redirecting...");
        redirect(this.context, "/signin");
      })
      .catch(error => {
        console.error(error);
        // set state;
      });
  };
}
