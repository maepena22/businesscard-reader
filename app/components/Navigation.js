export default function Navigation() {
    return (
        <nav className="bg-white shadow-md mb-6">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="text-xl font-bold text-gray-900">
                        Business Card Scanner
                    </div>
                    <div className="flex space-x-6">
                        <a href="/" className="text-gray-700 hover:text-red-500">
                            Upload
                        </a>
                        <a href="/records" className="text-gray-700 hover:text-red-500">
                            Records
                        </a>
                        <a href="/employees" className="text-gray-700 hover:text-red-500">
                            Employees
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}