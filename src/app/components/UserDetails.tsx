import { useSession } from 'next-auth/react';

export default function UserDetails() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <p><strong>Username:</strong> {session.user.name}</p>
      <p><strong>Email:</strong> {session.user.email}</p>
      <p><strong>Role:</strong> {session.user.role}</p>
    </div>
  );
}