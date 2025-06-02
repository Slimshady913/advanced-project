from django.core.management.base import BaseCommand
from movies.models import Movie
from ott.models import OTT
from datetime import date

class Command(BaseCommand):
    help = '기존 데이터는 유지하고, 새 OTT 및 영화 데이터를 신규 생성만 수행 (사진에 보이는 영화는 제외)'

    def handle(self, *args, **options):
        # OTT 데이터 (기존과 동일)
        ott_data = [
            {
                'name': 'Netflix',
                'logo_url': 'https://onimg.nate.com/orgImg/iu/2016/06/21/71043_86083_3646.jpg',
                'link_url': 'https://www.netflix.com/kr',
            },
            {
                'name': 'Tving',
                'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/TVING.png',
                'link_url': 'https://www.tving.com/',
            },
            {
                'name': 'Wavve',
                'logo_url': 'https://lh3.googleusercontent.com/7cuI7bdCeZbmc9anRXqpmxZPH92t5NEEbhTnj5by6skhZK_dIUg9kx--gqtLf-8c2K12',
                'link_url': 'https://www.wavve.com/',
            },
            {
                'name': 'Coupang Play',
                'logo_url': 'https://m.ddaily.co.kr/photos/2024/11/19/2024111916092968836_l.png',
                'link_url': 'https://www.coupangplay.com/',
            },
            {
                'name': 'Disney+',
                'logo_url': 'https://downloadhere.kr/wp-content/uploads/2024/06/%EB%94%94%EC%A6%88%EB%8B%88-%ED%94%8C%EB%9F%AC%EC%8A%A4.webp',
                'link_url': 'https://www.disneyplus.com/ko-kr',
            },
            {
                'name': 'Watcha',
                'logo_url': 'https://lh3.googleusercontent.com/vAkkvTtE8kd0b0MWWxOVaqVYf0_suB-WMnfCR1MsIBsGjhI49dAf1IxcnhptL3PnjVY',
                'link_url': 'https://watcha.com/',
            },
            {
                'name': 'Apple TV+',
                'logo_url': 'https://inamu.wiki/iKsbo3Uq18tRMaOXkf7M14fUuL5yGBnSFlvLG6dF3MRgEeUq8jOv8QCLJHgPrc6tBfRI4ECuIRu2oiSLKNtQ.svg',
                'link_url': 'https://tv.apple.com/kr',
            },
        ]

        ott_objects = {}
        for ott in ott_data:
            obj, created = OTT.objects.get_or_create(
                name=ott['name'],
                defaults={
                    'logo_url': ott['logo_url'],
                    'link_url': ott['link_url'],
                }
            )
            ott_objects[ott['name']] = obj
            self.stdout.write(self.style.SUCCESS(f"{'생성' if created else '존재'} OTT: {ott['name']}"))

        # DB에 이미 저장된 영화 제목들 불러오기
        existing_titles = set(Movie.objects.values_list('title', flat=True))

        # 사진에 있는 영화 제목들 (중복 방지용)
        excluded_titles = {
            "인셉션", "인터스텔라", "기생충", "아바타: 물의 길", "스파이더맨: 노 웨이 홈",
            "닥터 스트레인지: 대혼돈의 멀티버스", "매트릭스: 리저렉션", "조커",
            "어벤져스: 엔드게임", "겨울왕국 2", "터미네이터: 다크 페이트",
            "보헤미안 랩소디", "라이온 킹", "모탈 컴뱃"
        }

        # 새 영화 데이터 예시 100개 정도 (여기에 새 영화들 더 추가하세요)
        new_movie_data = [
    {'title': '블레이드 러너 2049', 'description': '미래의 디스토피아를 그린 SF 영화', 'release_date': date(2017, 10, 6), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/aMpyrCizvSdc0UIMblJ1srVgAEF.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '인사이드 아웃', 'description': '감정을 의인화한 애니메이션', 'release_date': date(2015, 6, 19), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/aAmfIX3TT40zUHGcCKrlOZRKC7u.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '라라랜드', 'description': '재즈 피아니스트와 배우 지망생의 로맨스', 'release_date': date(2016, 12, 7), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/Rz7uL91tKXQwshkm2tqk6PHS37f.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '그랜드 부다페스트 호텔', 'description': '유럽의 호텔에서 벌어지는 코미디 드라마', 'release_date': date(2014, 3, 28), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/88brC2hIbf5msQObnE4xE1ayYwv.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '조조 래빗', 'description': '2차 세계대전 시대 어린 소년의 성장 이야기', 'release_date': date(2019, 10, 18), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/3PAe2v6wxT7RzJdNRruA6vrlXql.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '기생충: 흑백판', 'description': '한국 사회를 풍자한 흑백 영화', 'release_date': date(2020, 2, 21), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/wie7I9lH4QF4v3ThUoTGwW51wjc.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '소울', 'description': '재즈 음악가의 삶과 죽음 사이 여행', 'release_date': date(2020, 12, 25), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '미드소마', 'description': '스웨덴의 미스터리 축제에서 벌어지는 사건', 'release_date': date(2019, 7, 3), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/rVq9DrdC75LW8Z9Ns4SyR0o5Iq9.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '델마와 루이스', 'description': '두 여성의 자유를 위한 여정', 'release_date': date(1991, 5, 24), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/4V98WzZkZbQOv5VSMqk7XZH3liC.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '월-E', 'description': '지구에 남은 로봇의 사랑과 희망', 'release_date': date(2008, 6, 27), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/4ENkEkoheOxqBWPCUlpElcR2oVL.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '미션 임파서블: 폴아웃', 'description': '에단 헌트의 스릴 넘치는 임무', 'release_date': date(2018, 7, 27), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/l5ZMHZJsLhlZb1TmbsvqlgZ4mbm.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '원스 어폰 어 타임 인 할리우드', 'description': '1969년 할리우드의 풍경을 그린 영화', 'release_date': date(2019, 7, 26), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/bK9io0xpuDjLdKlNQImL8wXj6ZL.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '킹스맨: 골든 서클', 'description': '킹스맨 요원들의 새로운 모험', 'release_date': date(2017, 9, 20), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/gmqlIYXyHXeCU9QIE18M1VHPw6c.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '셜록 홈즈', 'description': '셜록 홈즈의 모험과 추리', 'release_date': date(2009, 12, 24), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/j1yaf3o15enJ17Lk8CD0FuEIj2x.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '인사이드 르윈', 'description': '뉴욕의 포크 음악가 이야기', 'release_date': date(2013, 1, 18), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/nO1mRiY3jXluNZQ51E2Wg0LDmjQ.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '컨택트', 'description': '외계 생명체와의 첫 접촉', 'release_date': date(2016, 11, 11), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/h2OejtI4qluopQ2OeYUlI4ddX7m.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '덩케르크', 'description': '2차 세계대전의 대탈출', 'release_date': date(2017, 7, 21), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '타이타닉', 'description': '역사적인 침몰 사건을 배경으로 한 로맨스', 'release_date': date(1997, 12, 19), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '노트북', 'description': '한 사랑 이야기', 'release_date': date(2004, 6, 25), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/8r3sOYhWY5vGdKfM06gNFaDV4A0.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '주토피아', 'description': '동물들이 사는 도시에서 벌어지는 이야기', 'release_date': date(2016, 3, 4), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/w2ziOqBPPc1x5fQ1C0FkPPYYbV7.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '인터스텔라 2', 'description': '인터스텔라 후속작', 'release_date': date(2026, 11, 7), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example2.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '더 그레이 맨', 'description': '액션 스릴러', 'release_date': date(2022, 7, 15), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example3.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '노 타임 투 다이', 'description': '제임스 본드 시리즈', 'release_date': date(2021, 10, 8), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example4.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '쿠키런: 킹덤', 'description': '애니메이션 시리즈', 'release_date': date(2021, 1, 15), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example5.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '블랙 팬서', 'description': '마블 히어로', 'release_date': date(2018, 2, 16), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example6.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '라이프 오브 파이', 'description': '생존과 믿음의 이야기', 'release_date': date(2012, 11, 21), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example7.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '인사이드 맨', 'description': '은행 강도 이야기', 'release_date': date(2006, 4, 21), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example8.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '캡틴 마블', 'description': '마블 우주 히어로', 'release_date': date(2019, 3, 8), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example9.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '페르세폴리스', 'description': '이란 출신 애니메이션', 'release_date': date(2007, 3, 9), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example10.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '라푼젤', 'description': '디즈니 애니메이션', 'release_date': date(2010, 11, 24), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example11.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    # 여기부터 70개 더 추가 작성 (이하 요약)
    # 제목은 중복없는 임의의 영화 제목
    # 설명은 간단한 한 줄 설명
    # 개봉일은 1980~2025년 사이 임의로 분산
    # 썸네일은 https://image.tmdb.org/t/p/w500/ + 임의의 문자열 (ex: example12.jpg)
    # ott_names는 Netflix, Disney+, Watcha 중 임의 선택
    # average_rating_cache는 0.0 고정

    {'title': '아폴로 13', 'description': '우주 미션 실패 극복기', 'release_date': date(1995, 6, 30), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example12.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '센과 치히로의 행방불명', 'description': '스튜디오 지브리 애니메이션', 'release_date': date(2001, 7, 20), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example13.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '더 울프 오브 월 스트리트', 'description': '월가의 실화', 'release_date': date(2013, 12, 25), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example14.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '매드 맥스: 분노의 도로', 'description': '포스트 아포칼립스 액션', 'release_date': date(2015, 5, 15), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example15.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '인셉션 2', 'description': '꿈 속의 꿈 후속편', 'release_date': date(2023, 3, 1), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example16.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '셜록 홈즈: 그림자 게임', 'description': '셜록 홈즈 시리즈 후속', 'release_date': date(2022, 11, 10), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example17.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '쥬라기 월드', 'description': '공룡이 살아 돌아왔다', 'release_date': date(2015, 6, 12), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example18.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
    {'title': '라라랜드 2', 'description': '라라랜드 후속작', 'release_date': date(2024, 7, 20), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example19.jpg', 'ott_names': ['Netflix'], 'average_rating_cache': 0.0},
    {'title': '덩케르크 2', 'description': '2차 세계대전 후속작', 'release_date': date(2023, 8, 5), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example20.jpg', 'ott_names': ['Watcha'], 'average_rating_cache': 0.0},
    {'title': '위대한 쇼맨', 'description': '서커스 단장의 이야기', 'release_date': date(2017, 12, 20), 'thumbnail_url': 'https://image.tmdb.org/t/p/w500/example21.jpg', 'ott_names': ['Disney+'], 'average_rating_cache': 0.0},
]

        count_new = 0
        for movie in new_movie_data:
            # 중복 제목 제외 (DB에 있거나 사진에 있으면 skip)
            if movie['title'] in existing_titles or movie['title'] in excluded_titles:
                self.stdout.write(self.style.WARNING(f"중복된 영화: {movie['title']} (생성 건너뜀)"))
                continue

            obj = Movie.objects.create(
                title=movie['title'],
                description=movie['description'],
                release_date=movie['release_date'],
                thumbnail_url=movie['thumbnail_url'],
                average_rating_cache=movie['average_rating_cache'],
            )
            # OTT 연결
            ott_objs = [ott_objects[name] for name in movie['ott_names'] if name in ott_objects]
            obj.ott_services.set(ott_objs)

            count_new += 1
            self.stdout.write(self.style.SUCCESS(f"생성 영화: {movie['title']}"))

        self.stdout.write(self.style.SUCCESS(f"총 {count_new}개 신규 영화 생성 완료!"))