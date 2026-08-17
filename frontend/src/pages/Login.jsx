import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function Login({ children }) {
  return (
    <Authenticator loginMechanisms={["email"]}>
      {() => children}
    </Authenticator>
  );
}

export default Login;