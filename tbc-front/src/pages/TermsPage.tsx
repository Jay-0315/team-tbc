export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
            <p className="leading-relaxed">
              본 약관은 HolaPop(이하 "회사")가 제공하는 소셜링 서비스(이하 "서비스")의 이용과 관련하여 
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제2조 (정의)</h2>
            <p className="leading-relaxed mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>"서비스"란 회사가 제공하는 온라인 모임 및 소셜 네트워킹 플랫폼을 의미합니다.</li>
              <li>"회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.</li>
              <li>"소셜링"이란 회원들이 생성하고 참여하는 온라인/오프라인 모임을 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <p className="leading-relaxed">
              본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다. 
              회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있으며, 
              변경된 약관은 공지사항을 통해 공지됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제4조 (회원가입)</h2>
            <p className="leading-relaxed">
              서비스 이용을 원하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 
              본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제5조 (서비스의 제공 및 변경)</h2>
            <p className="leading-relaxed">
              회사는 회원에게 다양한 소셜링 생성 및 참여 기능을 제공합니다. 
              회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있으며, 
              중요한 변경사항은 사전에 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">제6조 (회원의 의무)</h2>
            <ul className="list-disc list-inside space-y-1 ml-4 leading-relaxed">
              <li>회원은 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.</li>
              <li>회원은 서비스 이용 시 관련 법령 및 본 약관을 준수해야 합니다.</li>
              <li>회원은 다른 회원에게 피해를 주거나 불쾌감을 주는 행위를 해서는 안 됩니다.</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">시행일: 2025년 1월 1일</p>
        </div>
      </div>
    </div>
  );
} 