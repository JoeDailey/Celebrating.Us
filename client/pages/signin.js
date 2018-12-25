import redirect from "../lib/redirect";
import API from "../lib/API";

export default class Signin extends React.Component {

  render = () => (
    <form onSubmit={this.handleOnSubmit}>
      <br />
      <input name="email" placeholder="Email" />
      <br />
      <input name="password" placeholder="Password" type="password" />
      <br />
      <button>Sign In</button>
    </form>
  );

  handleOnSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    new API(this.context).signin(
      e.target.elements.email.value,
      e.target.elements.password.value
    )
      .then(signedIn => {
        console.log("redirecting...");
        redirect(this.context, "/");
      })
      .catch(error => {
        console.error(error);
        // set state;
      });
  };
}
