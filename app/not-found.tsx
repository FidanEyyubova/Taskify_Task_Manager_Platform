import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden px-4">
      {}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-400/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-yellow-400/40 rounded-full blur-3xl" />

      {}
      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-extrabold text-black bg-clip-text  mb-4 ">
          404
        </h1>

        <p className="text-gray-700 mb-8 text-lg">
          The page you are looking for is not found <br />
          or no longer exists.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white
          bg-black
          transition-all duration-300 shadow-lg hover:shadow-orange-400/40"
        >
          Go to home page
        </Link>
      </div>
    </div>
  );
}
