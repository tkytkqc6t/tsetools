from setuptools import setup, find_packages

setup(
    name="tsetools",
    version="0.1.0",
    description="A simple Python web server project.",
    author="Your Name",
    packages=find_packages(),
    install_requires=[
        "Flask"
    ],
    entry_points={
        "console_scripts": [
            "tsetools=server:main"
        ]
    },
    include_package_data=True,
    python_requires=">=3.7",
)
