from django.core.management.base import BaseCommand
from movies.models import Movie
from ott.models import OTT
from datetime import date

class Command(BaseCommand):
    help = '예시 OTT와 영화 데이터를 DB에 생성 (테스트용)'

    def handle(self, *args, **options):
        # OTT 데이터
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
                'logo_url': 'https://yt3.googleusercontent.com/ez46n2NTiXecVWqMgm3mcOzYI7_VcGO-aGGU8Hd-0VCfsdQCCrqT0o-OjltnR139V2ZHKLtkmg=s900-c-k-c0x00ffffff-no-rj',
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
            obj, created = OTT.objects.update_or_create(
                name=ott['name'],
                defaults={
                    'logo_url': ott['logo_url'],
                    'link_url': ott['link_url'],
                }
            )
            ott_objects[ott['name']] = obj
            self.stdout.write(self.style.SUCCESS(f"{'생성' if created else '갱신'} OTT: {ott['name']}"))

        # 영화 데이터 (인셉션, 라라랜드, 인터스텔라, 기생충 제외)
        movie_data = [
            {
                'title': '아바타: 물의 길',
                'description': '판도라의 세계를 배경으로 한 SF 모험',
                'release_date': date(2022, 12, 14),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/5NgqMXRp9I6zZX2tsz9uR1RJct9.jpg',
                'ott_names': ['Netflix'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '베놈 2: 렛 데어 비 카니지',
                'description': '베놈과 카니지가 맞붙는 액션 스릴러',
                'release_date': date(2021, 9, 30),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
                'ott_names': ['Watcha'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '스파이더맨: 노 웨이 홈',
                'description': '멀티버스가 열린 후 벌어지는 모험',
                'release_date': date(2021, 12, 15),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
                'ott_names': ['Netflix', 'Watcha'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '닥터 스트레인지: 대혼돈의 멀티버스',
                'description': '멀티버스의 혼돈 속에서 싸우는 닥터 스트레인지',
                'release_date': date(2022, 5, 4),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
                'ott_names': ['Disney+'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '매트릭스: 리저렉션',
                'description': '네오의 새로운 모험',
                'release_date': date(2021, 12, 22),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg',
                'ott_names': ['Netflix'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '조커',
                'description': '배트맨의 악당 조커의 탄생 이야기',
                'release_date': date(2019, 10, 2),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
                'ott_names': ['Netflix'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '어벤져스: 엔드게임',
                'description': '마블 히어로들의 대서사시',
                'release_date': date(2019, 4, 24),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                'ott_names': ['Disney+'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '겨울왕국 2',
                'description': '엘사와 안나의 새로운 모험',
                'release_date': date(2019, 11, 20),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/pjeMs3yqRmFL3giJy4PMXWZTTPa.jpg',
                'ott_names': ['Disney+'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '터미네이터: 다크 페이트',
                'description': '새로운 터미네이터의 등장',
                'release_date': date(2019, 11, 1),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg',
                'ott_names': ['Netflix'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '보헤미안 랩소디',
                'description': '퀸 밴드의 이야기',
                'release_date': date(2018, 10, 24),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg',
                'ott_names': ['Watcha'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '블랙 위도우',
                'description': '마블 히어로 블랙 위도우의 이야기',
                'release_date': date(2021, 7, 7),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/ytnhNRMQjS9i96qdntZwGqfX6PHq.jpg',
                'ott_names': ['Disney+'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '데드풀',
                'description': '히어로 코미디 액션',
                'release_date': date(2016, 2, 12),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/inVq3FRqcYIRl2la8iZikYYxFNR.jpg',
                'ott_names': ['Netflix'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '라이온 킹',
                'description': '디즈니의 고전 애니메이션',
                'release_date': date(1994, 6, 24),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/2bXbqYdUdNVa8VIWXVfclP2ICtT.jpg',
                'ott_names': ['Disney+'],
                'average_rating_cache': 0.0,
            },
            {
                'title': '해리 포터와 마법사의 돌',
                'description': '마법 세계로의 첫 걸음',
                'release_date': date(2001, 11, 16),
                'thumbnail_url': 'https://image.tmdb.org/t/p/w500/6fC7n1TNhGYvME3T9mvXYHahPqT.jpg',
                'ott_names': ['Netflix'],
                'average_rating_cache': 0.0,
            },
        ]

        for movie in movie_data:
            obj, created = Movie.objects.update_or_create(
                title=movie['title'],
                defaults={
                    'description': movie['description'],
                    'release_date': movie['release_date'],
                    'thumbnail_url': movie['thumbnail_url'],
                    'average_rating_cache': movie['average_rating_cache'],
                }
            )
            # OTT 연결
            ott_objs = [ott_objects[name] for name in movie['ott_names'] if name in ott_objects]
            obj.ott_services.set(ott_objs)
            self.stdout.write(self.style.SUCCESS(f"{'생성' if created else '갱신'} 영화: {movie['title']}"))

        self.stdout.write(self.style.SUCCESS("더미 OTT 및 영화 데이터 생성 완료!"))