import { fetchAuthSession } from "aws-amplify/auth";

export async function getUserGroups() {
  const session = await fetchAuthSession();

  console.log(
    "ACCESS TOKEN PAYLOAD:",
    session.tokens?.accessToken?.payload
  );

  const groups =
    session.tokens?.accessToken?.payload["cognito:groups"] || [];

  console.log("COGNITO GROUPS:", groups);

  return Array.isArray(groups)
    ? groups
    : [groups];
}

export async function isAdmin() {
  const groups = await getUserGroups();

  return groups.includes("ADMIN");
}

export async function isEmployee() {
  const groups = await getUserGroups();

  return groups.includes("EMPLOYEE");
}