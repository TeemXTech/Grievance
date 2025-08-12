export function GovernmentFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Government of Telangana */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/telangana-state-government-logo.png" alt="Telangana Logo" className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-sm">Government of Telangana</h3>
                <p className="text-xs text-gray-400 telugu-text">తెలంగాణ ప్రభుత్వం</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Official grievance management system for efficient citizen service delivery.
            </p>
          </div>

          {/* One Rise */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/one-rise-logo.png" alt="One Rise Logo" className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-sm">One Rise</h3>
                <p className="text-xs text-gray-400">Digital Governance Platform</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Empowering governments with digital solutions for better citizen engagement.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Quick Links</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Submit Request
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Track Status
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help & FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact Information</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <p>Helpline: 1800-XXX-XXXX</p>
              <p>Email: support@telangana.gov.in</p>
              <p>Office Hours: 9:00 AM - 6:00 PM</p>
              <p>Monday to Friday</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <img src="/placeholder.svg?height=24&width=24&text=TS" alt="Telangana Logo" className="w-6 h-6" />
              <img src="/placeholder.svg?height=24&width=24&text=1R" alt="One Rise Logo" className="w-6 h-6" />
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400">© 2024 Government of Telangana. All rights reserved.</p>
              <p className="text-xs text-gray-500 telugu-text">© 2024 తెలంగాణ ప్రభుత్వం. అన్ని హక్కులు రక్షించబడ్డాయి.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
