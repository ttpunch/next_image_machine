import { useSession, signOut } from 'next-auth/react';

export default function UserDetails() {
  const { data: session } = useSession();

  if (!session) return null;
  console.log(session);
  return (
    <div className="flex items-center gap-4">
      <span className="font-bold">{session.user.username} Looged in </span>
      <button
        onClick={() => signOut()}
        className="px-4 py-1 border rounded-lg hover:bg-gray-700"
      >
        Logout
      </button>
    </div>
  );
}