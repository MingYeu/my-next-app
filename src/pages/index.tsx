// pages/index.tsx
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

const Home = () => {
  const [staffs, setStaffs] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/staff/staff"); // Changed to port 4000
        const data = await response.json();
        console.log("data", data);

        setStaffs(data);
      } catch (error) {
        console.error("Error fetching staffs:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {staffs.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
