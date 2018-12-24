import fetch from "cross-fetch";

export default {
   loggedInUser: (async () => {
    const userData = await (fetch('http://localhost:3001/self'));
    return userData.json();
  })
}
