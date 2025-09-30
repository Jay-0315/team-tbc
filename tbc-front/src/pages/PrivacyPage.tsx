export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="leading-relaxed mb-2">
              HolaPop은 다음의 목적을 위하여 개인정보를 처리합니다. 
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>회원 가입 및 관리</li>
              <li>소셜링 서비스 제공</li>
              <li>결제 및 환불 처리</li>
              <li>고객 문의 및 불만 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 수집하는 개인정보 항목</h2>
            <p className="leading-relaxed mb-2">필수 항목:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
              <li>이메일 주소</li>
              <li>닉네임</li>
              <li>비밀번호 (암호화 저장)</li>
            </ul>
            <p className="leading-relaxed mb-2">선택 항목:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>프로필 사진</li>
              <li>자기소개</li>
              <li>관심 카테고리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용기간</h2>
            <p className="leading-relaxed">
              회원의 개인정보는 회원 탈퇴 시까지 보유 및 이용됩니다. 
              다만, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="leading-relaxed">
              회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>회원이 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 개인정보의 파기</h2>
            <p className="leading-relaxed">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
              지체없이 해당 개인정보를 파기합니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 
              기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 회원의 권리와 의무</h2>
            <p className="leading-relaxed">
              회원은 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 
              가입 해지를 요청할 수도 있습니다. 마이페이지를 통해 직접 열람, 정정 또는 탈퇴가 가능하며, 
              개인정보관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체없이 조치하겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 개인정보 보호책임자</h2>
            <p className="leading-relaxed">
              개인정보 처리에 관한 업무를 총괄해서 책임지고, 
              개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 
              아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p><strong>개인정보 보호책임자</strong></p>
              <p className="mt-1">이메일: huny000315@gmail.com</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">시행일: 2025년 1월 1일</p>
        </div>
      </div>
    </div>
  );
} 