-- Migration 027: Stations table with Sydney seed data
-- Stores train/metro station locations for proximity search

CREATE TABLE IF NOT EXISTS stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  city TEXT NOT NULL DEFAULT 'Sydney',
  line TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast geo queries
CREATE INDEX IF NOT EXISTS idx_stations_city ON stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_lat_lng ON stations(lat, lng);

-- Allow public read access
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stations_public_read" ON stations FOR SELECT USING (true);

-- Sydney Metro & Train Stations seed data (100+ stations)
INSERT INTO stations (name, lat, lng, city, line) VALUES
-- Sydney Metro Northwest
('Tallawong', -33.6927, 150.9051, 'Sydney', 'Metro Northwest'),
('Rouse Hill', -33.6833, 150.9233, 'Sydney', 'Metro Northwest'),
('Kellyville', -33.7183, 150.9547, 'Sydney', 'Metro Northwest'),
('Bella Vista', -33.7369, 150.9469, 'Sydney', 'Metro Northwest'),
('Norwest', -33.7317, 150.9564, 'Sydney', 'Metro Northwest'),
('Hills Showground', -33.7286, 150.9819, 'Sydney', 'Metro Northwest'),
('Castle Hill', -33.7306, 151.0050, 'Sydney', 'Metro Northwest'),
('Cherrybrook', -33.7469, 151.0303, 'Sydney', 'Metro Northwest'),
('Epping', -33.7725, 151.0819, 'Sydney', 'Metro Northwest'),
('Macquarie University', -33.7744, 151.1128, 'Sydney', 'Metro Northwest'),
('Macquarie Park', -33.7764, 151.1214, 'Sydney', 'Metro Northwest'),
('North Ryde', -33.7928, 151.1283, 'Sydney', 'Metro Northwest'),
('Chatswood', -33.7978, 151.1822, 'Sydney', 'Metro Northwest'),

-- T1 North Shore & Western
('Central', -33.8833, 151.2064, 'Sydney', 'T1'),
('Town Hall', -33.8733, 151.2069, 'Sydney', 'T1'),
('Wynyard', -33.8664, 151.2058, 'Sydney', 'T1'),
('Milsons Point', -33.8456, 151.2117, 'Sydney', 'T1'),
('North Sydney', -33.8397, 151.2072, 'Sydney', 'T1'),
('Waverton', -33.8386, 151.1994, 'Sydney', 'T1'),
('Wollstonecraft', -33.8308, 151.1953, 'Sydney', 'T1'),
('St Leonards', -33.8233, 151.1944, 'Sydney', 'T1'),
('Artarmon', -33.8097, 151.1856, 'Sydney', 'T1'),
('Gordon', -33.7564, 151.1544, 'Sydney', 'T1'),
('Pymble', -33.7444, 151.1439, 'Sydney', 'T1'),
('Turramurra', -33.7319, 151.1306, 'Sydney', 'T1'),
('Wahroonga', -33.7175, 151.1169, 'Sydney', 'T1'),
('Hornsby', -33.7022, 151.0983, 'Sydney', 'T1'),
('Strathfield', -33.8706, 151.0933, 'Sydney', 'T1'),
('Burwood', -33.8781, 151.1039, 'Sydney', 'T1'),
('Ashfield', -33.8878, 151.1253, 'Sydney', 'T1'),
('Lidcombe', -33.8644, 151.0444, 'Sydney', 'T1'),
('Auburn', -33.8522, 151.0319, 'Sydney', 'T1'),
('Granville', -33.8328, 151.0122, 'Sydney', 'T1'),
('Parramatta', -33.8172, 151.0050, 'Sydney', 'T1'),
('Westmead', -33.8089, 150.9869, 'Sydney', 'T1'),
('Pendle Hill', -33.8014, 150.9556, 'Sydney', 'T1'),
('Toongabbie', -33.7936, 150.9494, 'Sydney', 'T1'),
('Seven Hills', -33.7742, 150.9361, 'Sydney', 'T1'),
('Blacktown', -33.7686, 150.9067, 'Sydney', 'T1'),
('Rooty Hill', -33.7719, 150.8444, 'Sydney', 'T1'),
('Mount Druitt', -33.7681, 150.8217, 'Sydney', 'T1'),
('St Marys', -33.7622, 150.7764, 'Sydney', 'T1'),
('Penrith', -33.7511, 150.6883, 'Sydney', 'T1'),

-- T2 Inner West & Leppington / Airport
('Museum', -33.8767, 151.2094, 'Sydney', 'T2'),
('St James', -33.8719, 151.2119, 'Sydney', 'T2'),
('Circular Quay', -33.8619, 151.2117, 'Sydney', 'T2'),
('Martin Place', -33.8678, 151.2108, 'Sydney', 'T2'),
('Kings Cross', -33.8750, 151.2225, 'Sydney', 'T2'),
('Edgecliff', -33.8797, 151.2369, 'Sydney', 'T2'),
('Bondi Junction', -33.8914, 151.2475, 'Sydney', 'T2'),
('Redfern', -33.8928, 151.1981, 'Sydney', 'T2'),
('Erskineville', -33.9017, 151.1858, 'Sydney', 'T2'),
('St Peters', -33.9131, 151.1792, 'Sydney', 'T2'),
('Sydenham', -33.9167, 151.1672, 'Sydney', 'T2'),
('Tempe', -33.9250, 151.1567, 'Sydney', 'T2'),
('Wolli Creek', -33.9281, 151.1531, 'Sydney', 'T2'),
('Domestic Airport', -33.9414, 151.1739, 'Sydney', 'T2'),
('International Airport', -33.9472, 151.1661, 'Sydney', 'T2'),

-- T3 Bankstown
('Canterbury', -33.9114, 151.1181, 'Sydney', 'T3'),
('Campsie', -33.9119, 151.1036, 'Sydney', 'T3'),
('Belmore', -33.9161, 151.0883, 'Sydney', 'T3'),
('Lakemba', -33.9192, 151.0753, 'Sydney', 'T3'),
('Punchbowl', -33.9242, 151.0536, 'Sydney', 'T3'),
('Bankstown', -33.9178, 151.0336, 'Sydney', 'T3'),

-- T4 Eastern Suburbs & Illawarra
('Mascot', -33.9286, 151.1878, 'Sydney', 'T4'),
('Green Square', -33.9061, 151.2003, 'Sydney', 'T4'),
('Hurstville', -33.9642, 151.1028, 'Sydney', 'T4'),
('Rockdale', -33.9519, 151.1364, 'Sydney', 'T4'),
('Kogarah', -33.9631, 151.1331, 'Sydney', 'T4'),

-- T5 Cumberland
('Merrylands', -33.8364, 150.9922, 'Sydney', 'T5'),
('Guildford', -33.8561, 150.9864, 'Sydney', 'T5'),
('Yennora', -33.8628, 150.9703, 'Sydney', 'T5'),
('Fairfield', -33.8722, 150.9569, 'Sydney', 'T5'),
('Canley Vale', -33.8844, 150.9414, 'Sydney', 'T5'),
('Cabramatta', -33.8936, 150.9364, 'Sydney', 'T5'),
('Liverpool', -33.9253, 150.9233, 'Sydney', 'T5'),

-- T7 Olympic Park
('Olympic Park', -33.8467, 151.0694, 'Sydney', 'T7'),

-- T8 Airport & South
('Revesby', -33.9494, 151.0139, 'Sydney', 'T8'),
('Padstow', -33.9522, 151.0342, 'Sydney', 'T8'),
('Riverwood', -33.9503, 151.0519, 'Sydney', 'T8'),
('Narwee', -33.9553, 151.0669, 'Sydney', 'T8'),

-- T9 Northern
('Eastwood', -33.7919, 151.0814, 'Sydney', 'T9'),
('Denistone', -33.7978, 151.0869, 'Sydney', 'T9'),
('West Ryde', -33.8069, 151.0908, 'Sydney', 'T9'),
('Meadowbank', -33.8164, 151.0908, 'Sydney', 'T9'),
('Rhodes', -33.8300, 151.0861, 'Sydney', 'T9'),
('Concord West', -33.8364, 151.0881, 'Sydney', 'T9'),
('North Strathfield', -33.8586, 151.0892, 'Sydney', 'T9'),

-- South West (T2 branch)
('Leppington', -33.9622, 150.8078, 'Sydney', 'T2'),
('Edmondson Park', -33.9611, 150.8594, 'Sydney', 'T2'),

-- Metro City & Southwest (new line)
('Waterloo', -33.9006, 151.2028, 'Sydney', 'Metro City'),
('Gadigal', -33.8836, 151.2094, 'Sydney', 'Metro City'),
('Crows Nest', -33.8264, 151.2003, 'Sydney', 'Metro City'),
('Victoria Cross', -33.8389, 151.2078, 'Sydney', 'Metro City'),
('Barangaroo', -33.8608, 151.2014, 'Sydney', 'Metro City'),
('Pitt Street', -33.8736, 151.2094, 'Sydney', 'Metro City'),

-- Light Rail (L1 Dulwich Hill)
('Dulwich Hill', -33.9111, 151.1381, 'Sydney', 'L1'),
('Lewisham West', -33.8953, 151.1400, 'Sydney', 'L1'),
('Taverners Hill', -33.8917, 151.1547, 'Sydney', 'L1'),
('Leichhardt North', -33.8831, 151.1564, 'Sydney', 'L1'),
('Lilyfield', -33.8725, 151.1644, 'Sydney', 'L1'),
('Rozelle Bay', -33.8672, 151.1708, 'Sydney', 'L1'),
('Glebe', -33.8789, 151.1861, 'Sydney', 'L1'),

-- Light Rail (L2/L3 CBD & South East)
('Randwick', -33.9150, 151.2414, 'Sydney', 'L2'),
('UNSW High Street', -33.9153, 151.2314, 'Sydney', 'L2'),
('Kingsford', -33.9214, 151.2272, 'Sydney', 'L3'),
('Juniors Kingsford', -33.9244, 151.2256, 'Sydney', 'L3'),
('Surry Hills', -33.8858, 151.2097, 'Sydney', 'L2'),
('Moore Park', -33.8972, 151.2200, 'Sydney', 'L2'),

-- Melbourne stations (top 50)
('Flinders Street', -37.8183, 144.9671, 'Melbourne', 'Metro'),
('Southern Cross', -37.8184, 144.9525, 'Melbourne', 'Metro'),
('Melbourne Central', -37.8103, 144.9628, 'Melbourne', 'Metro'),
('Parliament', -37.8111, 144.9731, 'Melbourne', 'Metro'),
('Flagstaff', -37.8117, 144.9556, 'Melbourne', 'Metro'),
('Richmond', -37.8236, 144.9897, 'Melbourne', 'Metro'),
('South Yarra', -37.8386, 144.9922, 'Melbourne', 'Metro'),
('Footscray', -37.7997, 144.8994, 'Melbourne', 'Metro'),
('Sunshine', -37.7878, 144.8331, 'Melbourne', 'Metro'),
('Box Hill', -37.8194, 145.1214, 'Melbourne', 'Metro'),
('Caulfield', -37.8772, 145.0422, 'Melbourne', 'Metro'),
('Glen Waverley', -37.8789, 145.1628, 'Melbourne', 'Metro'),
('Dandenong', -37.9864, 145.2128, 'Melbourne', 'Metro'),
('Frankston', -38.1428, 145.1264, 'Melbourne', 'Metro'),
('Ringwood', -37.8153, 145.2297, 'Melbourne', 'Metro'),
('Camberwell', -37.8264, 145.0594, 'Melbourne', 'Metro'),
('Hawthorn', -37.8222, 145.0222, 'Melbourne', 'Metro'),
('Glenferrie', -37.8219, 145.0367, 'Melbourne', 'Metro'),
('Carnegie', -37.8875, 145.0564, 'Melbourne', 'Metro'),
('Oakleigh', -37.8992, 145.0894, 'Melbourne', 'Metro'),
('Clayton', -37.9250, 145.1194, 'Melbourne', 'Metro'),
('Huntingdale', -37.9108, 145.1028, 'Melbourne', 'Metro'),
('Moorabbin', -37.9353, 145.0450, 'Melbourne', 'Metro'),
('Sandringham', -37.9508, 145.0047, 'Melbourne', 'Metro'),
('Brighton Beach', -37.9167, 145.0000, 'Melbourne', 'Metro'),
('North Melbourne', -37.8069, 144.9428, 'Melbourne', 'Metro'),
('Essendon', -37.7508, 144.9117, 'Melbourne', 'Metro'),
('Broadmeadows', -37.6842, 144.9219, 'Melbourne', 'Metro'),
('Craigieburn', -37.6003, 144.9428, 'Melbourne', 'Metro'),
('Coburg', -37.7444, 144.9639, 'Melbourne', 'Metro'),
('Preston', -37.7394, 145.0147, 'Melbourne', 'Metro'),
('Heidelberg', -37.7553, 145.0614, 'Melbourne', 'Metro'),
('Greensborough', -37.7036, 145.1064, 'Melbourne', 'Metro'),
('Eltham', -37.7133, 145.1481, 'Melbourne', 'Metro'),
('Hurstbridge', -37.6375, 145.1944, 'Melbourne', 'Metro'),
('Werribee', -37.8975, 144.6611, 'Melbourne', 'Metro'),
('Williamstown', -37.8639, 144.8942, 'Melbourne', 'Metro'),
('Newport', -37.8433, 144.8831, 'Melbourne', 'Metro'),
('Laverton', -37.8614, 144.7669, 'Melbourne', 'Metro'),
('Altona', -37.8681, 144.8306, 'Melbourne', 'Metro'),
('Nunawading', -37.8197, 145.1756, 'Melbourne', 'Metro'),
('Blackburn', -37.8194, 145.1500, 'Melbourne', 'Metro'),
('Lilydale', -37.7564, 145.3478, 'Melbourne', 'Metro'),
('Belgrave', -37.9086, 145.3539, 'Melbourne', 'Metro'),
('Berwick', -38.0364, 145.3494, 'Melbourne', 'Metro'),
('Pakenham', -38.0722, 145.4833, 'Melbourne', 'Metro'),
('Cranbourne', -38.0981, 145.2839, 'Melbourne', 'Metro'),
('Mernda', -37.6050, 145.0939, 'Melbourne', 'Metro'),
('South Morang', -37.6503, 145.0889, 'Melbourne', 'Metro'),
('Reservoir', -37.7178, 144.9928, 'Melbourne', 'Metro')
ON CONFLICT DO NOTHING;
