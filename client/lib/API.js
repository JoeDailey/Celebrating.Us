import redirect from "../lib/redirect";
import fetch from "cross-fetch";

const COOKIE = "user_token";

export default class API {
  context;
  ajax;

  constructor(context) {
    this.context = context;
    if (context && context.req) {
      const { req } = context;
      const baseUrl = `${req.protocol}://${req.get("Host")}`;
      this.ajax = async (path, conf) => {
        if (path.indexOf("?") > -1) {
          path += `&user_token=${req.cookies[COOKIE]}`;
        } else {
          path += `?user_token=${req.cookies[COOKIE]}`;
        }
        return fetch(baseUrl + path, conf);
      };
    } else {
      this.ajax = async (path, conf) =>
        fetch(path, Object.assign(conf || {}, { credentials: "same-origin" }));
    }
  }

  gate = async () => {
    const user = await this.loggedInUser();
    if (!user) {
      // If not signed in, send them somewhere more useful
      redirect(this.context, "/signin");
    }

    return user;
  };

  loggedInUser = async () => {
    const res = await this.ajax(`/api/self/`);
    const data = await res.json();
    return data.user == null ? null : data.user;
  };

  signin = async (email, password) => {
    const res = await this.ajax("/api/signin", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success == true) {
      return true;
    }

    throw Error(data.e);
  };

  signout = async (email, password) => {
    const res = await this.ajax("/api/signout", {
      method: "POST",
    });
    const data = await res.json();
    if (data.success == true) {
      return true;
    }

    throw Error(data.e);
  };
}
