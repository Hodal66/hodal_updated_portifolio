# andasy.hcl app configuration file generated for hodaltech2 on Thursday, 05-Mar-26 19:24:17 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "hodaltech2"

app {

  env = {}

  port = 80

  primary_region = "kgl"

  compute {
    cpu      = 1
    memory   = 256
    cpu_kind = "shared"
  }

  process {
    name = "hodaltech2"
  }

}
