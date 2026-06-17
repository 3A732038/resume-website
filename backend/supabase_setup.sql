-- ============================================================
-- 訪客記錄：在 Supabase 後台「SQL Editor」整段貼上、執行一次即可。
-- 會建立：
--   1) visits 表        ← 後端 middleware 自動寫入每筆訪問
--   2) 四個 View        ← 你之後在「Table Editor」點開就能看統計，不用再寫 SQL
-- ============================================================

-- 1) 原始明細表 ------------------------------------------------
create table if not exists public.visits (
    id          bigint generated always as identity primary key,
    created_at  timestamptz not null default now(),
    ip          text,
    country     text,
    city        text,
    user_agent  text,
    path        text,
    referer     text
);

-- 依時間查詢會比較快
create index if not exists visits_created_at_idx on public.visits (created_at desc);


-- 2) 統計用的 View（活的，永遠反映最新資料，不用手動更新）---------

-- 每日訪客數（以台灣時間分日）
create or replace view public.visits_daily as
select
    (created_at at time zone 'Asia/Taipei')::date as 日期,
    count(*)                                       as 瀏覽次數,
    count(distinct ip)                             as 不重複訪客
from public.visits
group by 1
order by 1 desc;

-- 每月訪客數
create or replace view public.visits_monthly as
select
    to_char(created_at at time zone 'Asia/Taipei', 'YYYY-MM') as 月份,
    count(*)                                                   as 瀏覽次數,
    count(distinct ip)                                         as 不重複訪客
from public.visits
group by 1
order by 1 desc;

-- 各國家訪客數
create or replace view public.visits_by_country as
select
    coalesce(country, '未知') as 國家,
    count(*)                   as 瀏覽次數,
    count(distinct ip)         as 不重複訪客
from public.visits
group by 1
order by 瀏覽次數 desc;

-- 最近 100 筆訪問明細（含 IP，時間轉成台灣時間）
create or replace view public.visits_recent as
select
    created_at at time zone 'Asia/Taipei' as 時間,
    ip,
    country as 國家,
    city    as 城市,
    path    as 頁面,
    referer as 來源,
    user_agent as 裝置
from public.visits
order by created_at desc
limit 100;
