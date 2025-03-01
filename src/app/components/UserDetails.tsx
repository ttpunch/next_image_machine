import { useSession, signOut } from 'next-auth/react';

export default function UserDetails() {
  const { data: session } = useSession();

  if (!session) return null;
  console.log(session);
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/sign-in' });
  };
  
  return (
    <div className="flex items-center gap-4">
      <span className="font-bold">{session.user.email} Looged in </span>
      <button
        onClick={handleSignOut}
        className="px-4 py-1 border rounded-lg hover:bg-gray-700"
      >
        Logout
      </button>
    </div>
  );
}