from setuptools import setup, find_packages

setup(
    name="tsetools",
    version="0.1.0",
    description="A simple Python web server project.",
    author="Your Name",
    packages=find_packages(),
    install_requires=[
        "Flask",
        "fastapi>=0.115,<1",
        "uvicorn[standard]>=0.30,<1",
        "python-multipart>=0.0.9,<1",
        "ijson>=3.3,<4",
    ],
    entry_points={
        "console_scripts": [
            "tsetools=server:main",
            "tsetools-large=fastapi_server:app"
        ]
    },
    include_package_data=True,
    python_requires=">=3.7",
)
