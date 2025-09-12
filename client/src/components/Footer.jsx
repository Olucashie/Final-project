export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-black/60">
        © {new Date().getFullYear()} AptFinder. All rights reserved.
      </div>
    </footer>
  )
}
