-- HUJA v22.5.1 – LiveCenter Quality Hotfix
update storage.buckets
set file_size_limit = 104857600
where id = 'live-moments';
