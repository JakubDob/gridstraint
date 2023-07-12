cmake_minimum_required(VERSION 3.21.3)

project(SolverService)

add_executable(
    SolverService
)

add_subdirectory(src)

target_compile_features(SolverService PRIVATE cxx_std_20)

# link with shared libs on windows and statically on other platforms
if(${CMAKE_HOST_SYSTEM_NAME} STREQUAL "Windows")
    target_compile_definitions(SolverService PRIVATE _WIN32_WINNT=0x0A00) #assumes win10, TODO: make it an option?
    target_compile_definitions(SolverService PRIVATE BOOST_FILESYSTEM_DYN_LINK)
else()
    target_compile_definitions(SolverService PRIVATE BOOST_FILESYSTEM_STATIC_LINK)
endif()

find_package(ProtonCpp CONFIG REQUIRED)
find_package(jsoncpp CONFIG REQUIRED)
find_package(Boost CONFIG REQUIRED COMPONENTS filesystem)

target_link_libraries(
    SolverService
    PRIVATE
    Boost::filesystem
    Proton::cpp
    jsoncpp_lib
)
#copy dlls to the location of the executable
if(${CMAKE_HOST_SYSTEM_NAME} STREQUAL "Windows")
    add_custom_command(TARGET SolverService POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_RUNTIME_DLLS:SolverService> $<TARGET_FILE_DIR:SolverService>
    COMMAND_EXPAND_LISTS
    )
endif()