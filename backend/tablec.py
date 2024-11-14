import psycopg2
import urllib.parse as urlparse

# Replace with your actual connection URL
# connection_url = "postgresql://neondb_owner:8ojEy7YLPIqC@ep-divine-snowflake-a1f3wioc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# # Connect to the PostgreSQL database using the connection URL
# try:
#     conn = psycopg2.connect(connection_url)
#     cursor = conn.cursor()
    
#     # Create users table
#     cursor.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
#     create_table_query = '''
#     CREATE TABLE users (
#         user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
#         firstname VARCHAR(50) NOT NULL,
#         lastname VARCHAR(50) NOT NULL,
#         email VARCHAR(100) UNIQUE NOT NULL,
#         password VARCHAR(255) NOT NULL,
#         number_books_borrowed INT DEFAULT 0
#     );
#     '''
    
#     cursor.execute(create_table_query)
#     conn.commit()
#     print("Users table created successfully.")

# except Exception as e:
#     print(f"An error occurred: {e}")

# finally:
#     # Close the database connection
#     if cursor:
#         cursor.close()
#     if conn:
#         conn.close()
