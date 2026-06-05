package com.example.be_hospital.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // Hàm này sẽ tự động chạy mỗi khi có 1 request gửi tới server
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Lấy chuỗi JWT từ request gửi lên
            String jwt = parseJwt(request);

            // 2. Nếu có JWT và JWT đó hợp lệ (chưa hết hạn, chữ ký đúng)
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                // 3. Lấy số điện thoại từ chuỗi JWT
                String phone = jwtUtils.getPhoneFromJwtToken(jwt);

                // 4. Lôi thông tin User từ Database lên (theo số điện thoại)
                UserDetails userDetails = userDetailsService.loadUserByUsername(phone);

                // 5. Tạo đối tượng xác thực để báo cho Spring Security biết user này đã đăng nhập hợp lệ
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Lưu thông tin xác thực vào Context của Spring
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            System.err.println("Không thể thiết lập xác thực người dùng: " + e.getMessage());
        }

        // 7. Cho phép request đi tiếp tục đến các màng lọc khác hoặc tới Controller
        filterChain.doFilter(request, response);
    }

    // Hàm hỗ trợ: Trích xuất đoạn mã JWT từ Header hoặc Query Parameter của request
    private String parseJwt(HttpServletRequest request) {
        // Thông thường React sẽ gửi token trong header có tên là "Authorization"
        String headerAuth = request.getHeader("Authorization");

        // Chuẩn JWT quy định token sẽ bắt đầu bằng chữ "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Cắt bỏ 7 ký tự "Bearer " để lấy lõi token
        }

        // Cũng cho phép lấy token từ query parameter (hỗ trợ cho kết nối SSE/EventSource)
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }

        return null;
    }
}
