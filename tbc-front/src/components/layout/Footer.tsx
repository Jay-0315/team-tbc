import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-gray-300 bg-gray-800 border-t border-gray-700">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <img 
                src="/holapop-logo.png" 
                alt="HolaPop Logo" 
                className="w-auto h-20"
              />
            </div>
            <p className="text-sm text-gray-400">
              함께 만드는 즐거운 모임 문화,<br />
              HolaPop과 함께하세요.
            </p>
            <div className="flex gap-4">
              <a href="#" className="transition-colors hover:text-yellow-400" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="transition-colors hover:text-yellow-400" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="transition-colors hover:text-yellow-400" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="mb-4 font-semibold text-white">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/notice" className="transition-colors hover:text-yellow-400">공지사항</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-yellow-400">자주 묻는 질문</Link></li>
              <li><a href="mailto:huny000315@gmail.com" className="transition-colors hover:text-yellow-400">문의하기</a></li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="mb-4 font-semibold text-white">회사</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="transition-colors hover:text-yellow-400">이용약관</Link></li>
              <li><Link to="/privacy" className="transition-colors hover:text-yellow-400">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 */}
        <div className="pt-6 mt-6 border-t border-gray-500">
          <div className="flex flex-col gap-4 justify-between items-center text-sm text-gray-500 md:flex-row">
            <div className="text-center md:text-left">
              <p>© 2025 HolaPop. All rights reserved.</p>
              <p className="mt-1">
                대표: Team HolaPoP
              </p>
              <p className="mt-1">
                Contact Us: huny000315@gmail.com
              </p>
            </div>
            
            <div className="flex gap-2 items-center text-gray-400">
              <span>Made by</span>
              <span className="font-semibold text-yellow-400">JH, SJ, DH, SH</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 