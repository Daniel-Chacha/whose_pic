"""Helpers for working with pgvector via asyncpg.

The pgvector adapter (`pgvector.asyncpg.register_vector`) lets us pass numpy
arrays / Python lists directly as `vector` parameters and reads them back as
numpy arrays. No string formatting needed at the call sites.
"""
