//package com.tbc.login.adapter.out.security;
//
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Component
//public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
//
//    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request,
//                                        HttpServletResponse response,
//                                        Authentication authentication) throws IOException, ServletException {
//
//        String email = null;
//
//        if (authentication instanceof OAuth2AuthenticationToken oauth) {
//            Object principal = oauth.getPrincipal();
//            if (principal instanceof OAuth2User oAuth2User) {
//                Map<String, Object> attrs = oAuth2User.getAttributes();
//                // 공급자 별 속성에서 이메일 추출 시도
//                // 구글: "email", 깃허브(기본은 email null일 수 있음): "email"
//                email = (String) attrs.get("email");
//                if (email == null) {
//                    // 필요시 provider 별 분기 추가
//                    email = (String) attrs.get("login"); // 깃허브 id 등
//                }
//            }
//        }
//
//        log.info("OAuth2 login success. email={}", email);
//
//        // TODO: 필요하다면 여기서 JWT 발급/쿠키 설정 로직 추가
//        response.sendRedirect("/");
//    }
//}
