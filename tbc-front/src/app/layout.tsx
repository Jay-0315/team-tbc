// 전역 레이아웃
import './globals.css'
import Header from '@/components/Header'
import React, { useState, useEffect } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ nickname?: string; realName?: string } | null>(null)

  useEffect(() => {
    checkLoginStatus()
    
    // 30분 자동 로그아웃 타이머 설정
    const inactivityTimer = setInterval(async () => {
      if (user) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            credentials: 'include',
            mode: 'cors'
          })
          
          if (!response.ok) {
            // 세션이 만료된 경우 자동 로그아웃
            setUser(null)
            alert('세션이 만료되어 자동으로 로그아웃되었습니다.')
          }
        } catch (error) {
          console.error('세션 확인 실패:', error)
          setUser(null)
        }
      }
    }, 30 * 60 * 1000) // 30분마다 체크

    // 사용자 활동 감지 (마우스 움직임, 키보드 입력 등)
    const resetTimer = () => {
      // 마지막 활동 시간을 localStorage에 저장
      localStorage.setItem('lastActivity', Date.now().toString())
    }

    // 이벤트 리스너 등록
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })

    // 페이지 로드 시 마지막 활동 시간 확인
    const lastActivity = localStorage.getItem('lastActivity')
    if (lastActivity && user) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
      if (timeSinceLastActivity > 30 * 60 * 1000) { // 30분 초과
        setUser(null)
        alert('장시간 활동이 없어 자동으로 로그아웃되었습니다.')
      }
    }

    return () => {
      clearInterval(inactivityTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [user])

  async function checkLoginStatus() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors'
      })
      
      if (response.ok) {
        const userData = await response.json()
        if (userData && userData.data) {
          setUser({
            nickname: userData.data.nickname,
            realName: userData.data.realName
          })
          // 로그인 성공 시 활동 시간 초기화
          localStorage.setItem('lastActivity', Date.now().toString())
        }
      }
    } catch {
      console.log('로그인되지 않음')
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors'
      })
      setUser(null)
      localStorage.removeItem('lastActivity')
      window.location.reload()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const handleLoginSuccess = async () => {
    // Header에서 이미 새로고침 처리됨
  }

  const handleSignupSuccess = async () => {
    // Header에서 이미 새로고침 처리됨
  }

  return (
    <html lang="ko">
      <body>
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onLoginSuccess={handleLoginSuccess}
          onSignupSuccess={handleSignupSuccess}
        />
        <main className="page">
          {React.cloneElement(children as React.ReactElement, {
            onOpenLogin: () => {
              // Header의 로그인 모달 열기 함수 호출
              const headerElement = document.querySelector('header')
              if (headerElement) {
                const loginButton = headerElement.querySelector('button[class*="text-btn"]') as HTMLButtonElement
                if (loginButton) {
                  loginButton.click()
                }
              }
            },
            onOpenSignup: () => {
              // Header의 회원가입 모달 열기 함수 호출
              const headerElement = document.querySelector('header')
              if (headerElement) {
                const signupButton = headerElement.querySelector('button[class*="primary-btn"]') as HTMLButtonElement
                if (signupButton) {
                  signupButton.click()
                }
              }
            }
          })}
        </main>
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>TBC</h3>
                <p>다양한 취미와 관심사를 공유하는 소모임 플랫폼</p>
              </div>
              <div className="footer-section">
                <h4>서비스</h4>
                <ul>
                  <li><a href="/">홈</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>지원</h4>
                <ul>
                  <li><a href="/help">도움말</a></li>
                  <li><a href="/contact">문의하기</a></li>
                  <li><a href="/privacy">개인정보처리방침</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 TBC. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
