"use client"
import { useState, FormEvent } from "react";
import { submitRepositories } from "../utils/api";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [inspirationRepo, setInspirationRepo] = useState("");
  const [userRepo, setUserRepo] = useState("");
  const [inspirationBranch, setInspirationBranch] = useState("");
  const [userBranch, setUserBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await submitRepositories(
        inspirationRepo,
        userRepo,
        inspirationBranch,
        userBranch
      );
      console.log(result);
      router.push(`/extract-feature/${result.sessionId}`);
    } catch (error) {
      console.error('Error submitting repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div >
      <h1 className="text-3xl m-auto text-center pt-14 pb-2">
        Code Mirror
      </h1>
      <h2 className="text-xl m-auto text-center pb-14">
        Clone and Implement Features from Any Public Repository
      </h2>      <div className="flex flex-col items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <label htmlFor="inspirationRepo" className="block mb-2">Inspiration Repository:</label>

          <div className="flex flex-row gap-5 justify-center">
            <div className="mb-4 w-[70%]">
              <input
                type="text"
                placeholder="GithubUserName/RepositoryName"
                id="inspirationRepo"
                value={inspirationRepo}
                onChange={(e) => setInspirationRepo(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-[rgba(156,156,156,0.3)] border-[rgba(83,254,234,0.3)]"
                required
              />
            </div>
            <div className="mb-4 w-[30%]">

              <input
                type="text"
                id="inspirationBranch"
                placeholder="Branch Name"
                value={inspirationBranch}
                onChange={(e) => setInspirationBranch(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-[rgba(156,156,156,0.3)] border-[rgba(83,254,234,0.3)]"
                required
              />
            </div>
          </div>
          <label htmlFor="inspirationRepo" className="block mb-2">Your Repository:</label>

          <div className="flex flex-row gap-5 justify-center">
            <div className="mb-4 w-[70%]">
              <input
                type="text"
                placeholder="GithubUserName/RepositoryName"
                id="userRepo"
                value={userRepo}
                onChange={(e) => setUserRepo(e.target.value)}
                className="w-full bg-[rgba(156,156,156,0.3)] border-[rgba(83,254,234,0.3)] px-3 py-2 border rounded "
                required
              />
            </div>
            <div className="mb-4 w-[30%]">

              <input
                type="text"
                id="userBranch"
                placeholder="Branch Name"
                value={userBranch}
                onChange={(e) => setUserBranch(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-[rgba(156,156,156,0.3)] border-[rgba(83,254,234,0.3)]"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-[rgb(255,255,255)] bg-[rgb(52,143,109)] rounded  hover:text-[rgb(218,218,218)] disabled:bg-[rgb(108,143,130)]"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>

  );
}
