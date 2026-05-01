import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserProfileForm from "@/components/profile/UserProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/admin-login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      fullName: true,
      email: true,
      profilePicture: true,
      pendingEmail: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/auth/admin-login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-black text-[#231F20] mb-2">My Profile</h1>
          <p className="text-gray-500 mb-8">Update your profile information and security settings.</p>
          
          <UserProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
