import { useSession, signOut } from 'next-auth/react';

export default function UserDetails() {
  const { data: session } = useSession();

  if (!session) return null;
  console.log(session);
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/sign-in' });
  };
  
  return (
    <div className="flex items-center justify-between w-full sm:justify-start sm:w-auto sm:gap-4">
      <span className="font-bold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
        {session.user.email} Logged in
      </span>
      <button
        onClick={handleSignOut}
        className="ml-2 sm:ml-0 px-3 sm:px-4 py-1 text-xs sm:text-sm border rounded-lg hover:bg-gray-700 hover:text-white"
      >
        Logout
      </button>
    </div>
  );
}