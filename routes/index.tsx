import { Head } from "$fresh/runtime.ts";
import CodeHighlighter from "../islands/CodeHighlighter.tsx";

export default function Home() {
  const typescriptCode = `// Sample TypeScript/JavaScript code
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      ...userData
    };
    
    this.users.push(newUser);
    return newUser;
  }

  private generateId(): number {
    return Math.floor(Math.random() * 10000) + 1;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }
}

// Usage example
const userService = new UserService();

userService.createUser({
  name: "John Doe",
  email: "john@example.com",
  isActive: true
}).then(user => {
  console.log("Created user:", user);
});`;

  return (
    <>
      <Head>
        <title>Zen Code - Prime</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div class="h-screen bg-gray-900 text-gray-100 flex items-center justify-center overflow-hidden">
        <div class="w-full max-w-5xl h-full flex items-center justify-center">
          <CodeHighlighter code={typescriptCode} />
        </div>
      </div>
    </>
  );
}
