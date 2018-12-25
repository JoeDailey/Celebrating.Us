import API from "../lib/API";
import LogOutButton from "../components/LogOutButton";

export default class Index extends React.Component {
  static async getInitialProps(context, props) {
    const user = await new API(context).gate();
    return { user };
  }

  render = () => {
    return (
      <div>
        <p>{`Hello ${this.props.user.display_name}!`}</p>
        <p>{`Your email is \`${this.props.user.email}\`.`}</p>
        <LogOutButton />
      </div>
    );
  };
}
