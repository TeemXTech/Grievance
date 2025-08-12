import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Redirect based on user role
  const role = session.user?.role

  if (role === "MINISTER") {
    redirect("/minister/dashboard")
  } else if (role === "PERSONAL_ASSISTANT") {
    redirect("/pa/dashboard")
  } else if (role === "FIELD_TEAM") {
    redirect("/field/dashboard")
  } else if (role === "ADMIN") {
    redirect("/admin/dashboard")
  } else {
    redirect("/dashboard")
  }
}
