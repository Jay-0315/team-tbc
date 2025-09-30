import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: '소셜링은 어떻게 만드나요?',
      answer: '로그인 후 우측 하단의 "소셜링 만들기" 버튼을 클릭하여 모임 정보를 입력하고 생성할 수 있습니다.'
    },
    {
      id: 2,
      question: '참가비는 어떻게 결제하나요?',
      answer: '마이페이지에서 포인트를 충전한 후, 모임 상세 페이지에서 "참가하기" 버튼을 통해 결제할 수 있습니다.'
    },
    {
      id: 3,
      question: '참가 취소는 어떻게 하나요?',
      answer: '마이페이지의 "참여 중인 모임"에서 취소하려는 모임을 선택한 후 취소 버튼을 클릭하면 됩니다. 모임 시작 24시간 전까지 취소 가능합니다.'
    },
    {
      id: 4,
      question: '환불 정책은 어떻게 되나요?',
      answer: '모임 시작 24시간 전 취소 시 100% 환불, 24시간 이내 취소 시 50% 환불됩니다. 환불은 포인트로 반환됩니다.'
    },
    {
      id: 5,
      question: '부적절한 모임이나 사용자를 신고하려면?',
      answer: '각 모임 상세 페이지나 사용자 프로필에서 신고 버튼을 클릭하여 신고할 수 있습니다. 관리자가 확인 후 조치합니다.'
    },
    {
      id: 6,
      question: '프로필 정보는 어떻게 수정하나요?',
      answer: '마이페이지에서 프로필 편집 버튼을 클릭하여 닉네임, 프로필 사진, 자기소개 등을 수정할 수 있습니다.'
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">자주 묻는 질문</h1>
        
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-left font-semibold text-gray-900">
                  Q. {faq.question}
                </h3>
                {openId === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openId === faq.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    A. {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">추가 문의사항이 있으신가요?</h3>
          <p className="text-gray-700">
            이메일로 문의해주세요: <a href="mailto:huny000315@gmail.com" className="text-yellow-600 hover:underline">huny000315@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
} 