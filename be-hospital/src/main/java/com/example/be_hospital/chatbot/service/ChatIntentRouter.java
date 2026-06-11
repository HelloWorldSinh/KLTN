package com.example.be_hospital.chatbot.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class ChatIntentRouter {

    public enum ChatIntent {
        FAQ,
        SYMPTOM,
        TOOL_LOOKUP,
        OUTSIDE_MEDICAL,
        GENERAL_MEDICAL
    }

    public ChatIntent classify(String question) {
        String text = normalize(question);

        if (containsAny(text,
                "lap trinh", "viet code", "sua code", "bong da", "chinh tri", "bitcoin",
                "chung khoan", "du bao thoi tiet", "giai phuong trinh", "viet bai van",
                "dich sang tieng anh")) {
            return ChatIntent.OUTSIDE_MEDICAL;
        }

        if (containsAny(text,
                "mo cua", "gio lam", "gio kham", "may gio", "thu bay", "chu nhat",
                "bao hiem", "bhyt", "nhap vien", "thu tuc", "cccd", "cmnd",
                "xet nghiem", "nhin an", "lay mau", "chi phi", "gia kham", "bao nhieu tien")) {
            return ChatIntent.FAQ;
        }

        if (containsAny(text,
                "toi bi", "trieu chung", "nen kham khoa nao", "dau", "sot", "ho ", "kho tho",
                "chong mat", "buon non", "tieu chay", "ngua", "chay mau", "chan thuong",
                "mang thai", "cham kinh", "dau tai", "dau hong", "ngat mui")) {
            return ChatIntent.SYMPTOM;
        }

        if (containsAny(text,
                "bac si", "lich kham", "lich truc", "lich trong", "dat lich",
                "danh sach chuyen khoa", "co nhung chuyen khoa", "chuyen khoa nao")) {
            return ChatIntent.TOOL_LOOKUP;
        }

        return ChatIntent.GENERAL_MEDICAL;
    }

    public String specialtySearchText(String question) {
        String text = normalize(question);

        if (containsAny(text, "dau tai", "u tai", "nghe kem", "ngat mui", "dau hong", "khan tieng")) {
            return "TAI MŨI HỌNG đau tai ù tai ngạt mũi đau họng " + question;
        }
        if (containsAny(text, "mang thai", "cham kinh", "kinh nguyet", "khi hu", "vung kin")) {
            return "SẢN PHỤ KHOA mang thai chậm kinh kinh nguyệt " + question;
        }
        if (containsAny(text, "tre em", "em be", "duoi 16", "be bi")) {
            return "NHI KHOA trẻ em dưới 16 tuổi " + question;
        }
        if (containsAny(text, "chan thuong", "gay xuong", "trat khop", "vet thuong", "ap xe")) {
            return "NGOẠI KHOA chấn thương gãy xương vết thương " + question;
        }
        return "NỘI KHOA triệu chứng người lớn " + question;
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }

        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'D')
                .toLowerCase(Locale.ROOT);
    }
}
